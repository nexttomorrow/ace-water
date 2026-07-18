import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { POPUP_DISMISS_HOURS, POPUP_DISMISS_LABEL, type Popup } from '@/lib/types'

/**
 * 일반(general) 팝업 = 브라우저 새 창(window.open) 대상 라우트.
 *
 * Route Handler 라 루트 레이아웃(헤더/푸터/PopupSystem)이 적용되지 않아
 * 팝업 내용만 담긴 독립 HTML 문서를 반환한다(재귀·군더더기 없음).
 * 닫기 → window.close(), 다시 보지 않기 → 메인 사이트와 같은 origin 의
 * localStorage 에 숨김 상태를 기록(popupStorage 와 동일 포맷)한다.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const popupId = Number(id)

  const htmlHeaders = { 'content-type': 'text/html; charset=utf-8' }

  if (!Number.isFinite(popupId)) {
    return new NextResponse(errorDoc('잘못된 접근'), { status: 400, headers: htmlHeaders })
  }

  const supabase = await createClient()
  // 공개 RLS = 활성 팝업만 조회 가능
  const { data } = await supabase.from('popups').select('*').eq('id', popupId).single()
  if (!data) {
    return new NextResponse(errorDoc('팝업을 찾을 수 없습니다'), { status: 404, headers: htmlHeaders })
  }

  return new NextResponse(renderPopupDoc(data as Popup), { headers: htmlHeaders })
}

function escHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
  )
}

function escJs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ')
}

function errorDoc(msg: string): string {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"/><title>팝업</title></head><body style="font-family:system-ui;padding:24px;color:#555">${escHtml(
    msg
  )}<br/><button onclick="window.close()">닫기</button></body></html>`
}

function renderPopupDoc(p: Popup): string {
  const dismiss = p.dismiss_option
  const dismissHours = dismiss === 'none' ? 0 : POPUP_DISMISS_HOURS[dismiss]
  const dismissLabel = dismiss === 'none' ? '' : POPUP_DISMISS_LABEL[dismiss]

  // 본문
  let content = ''
  if (p.content_type === 'html') {
    // body_html 은 저장 시 서버에서 정화(sanitize)된 값
    content = `<div class="c-html">${p.body_html ?? ''}</div>`
  } else if (p.image_url) {
    const img = `<img src="${escHtml(p.image_url)}" alt="${escHtml(p.title)}" draggable="false"/>`
    if (p.link_url) {
      content = p.open_new_tab
        ? `<a href="${escHtml(p.link_url)}" target="_blank" rel="noopener">${img}</a>`
        : `<a href="#" onclick="navTo('${escJs(p.link_url)}');return false;">${img}</a>`
    } else {
      content = img
    }
  }

  const dismissBtn =
    dismiss !== 'none'
      ? `<button type="button" onclick="hidePopup(${p.id}, ${dismissHours})">${escHtml(dismissLabel)}</button>`
      : '<span></span>'

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escHtml(p.title)}</title>
<style>
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;display:flex;flex-direction:column;min-height:100vh;background:#f5f5f5;color:#222}
  .content{flex:1 1 auto;min-height:0;overflow:auto}
  .content a{display:block}
  .content img{display:block;width:100%;height:auto}
  .c-html{padding:16px;line-height:1.6;font-size:15px}
  .bar{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e5e5e5;background:#fff;padding:8px 12px;font-size:13px}
  .bar button{background:none;border:0;cursor:pointer;color:#555;font-size:13px;padding:4px 6px;border-radius:4px}
  .bar button:hover{background:#f0f0f0;color:#111}
  .bar button:last-child{font-weight:600;color:#111}
</style>
</head>
<body>
  <div class="content">${content}</div>
  <div class="bar">
    ${dismissBtn}
    <button type="button" onclick="window.close()">닫기 ✕</button>
  </div>
  <script>
    function navTo(u){
      try{ if(window.opener && !window.opener.closed){ window.opener.location.href=u; window.close(); return; } }catch(e){}
      location.href=u;
    }
    function hidePopup(id, hours){
      try{
        var K='acewater:popup-hidden', now=Date.now(), m={};
        try{ m=JSON.parse(localStorage.getItem(K)||'{}')||{}; }catch(e){ m={}; }
        for(var k in m){ if(!(typeof m[k]==='number' && m[k]>now)) delete m[k]; }
        m[String(id)] = now + hours*3600000;
        localStorage.setItem(K, JSON.stringify(m));
      }catch(e){}
      window.close();
    }
  </script>
</body>
</html>`
}
