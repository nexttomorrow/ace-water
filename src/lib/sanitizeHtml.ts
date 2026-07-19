/**
 * 에디터(TipTap)로 작성한 HTML 을 저장 전에 정제한다.
 *
 * 왜 sanitize-html 인가:
 *   이전에는 isomorphic-dompurify 를 썼는데, 이건 서버에서 jsdom 을 끌어온다.
 *   jsdom 은 Next 의 기본 serverExternalPackages 목록에 있어 번들되지 않고 런타임에
 *   require() 되는데, jsdom 의존성 상당수가 ESM 전용이라 CJS require 로는 로드가
 *   실패한다(ERR_REQUIRE_ESM). 그 결과 프로덕션에서 이 모듈을 import 하는 라우트가
 *   전부 500 이 났다. sanitize-html 은 external 목록에 없어 정상적으로 번들되므로
 *   같은 문제가 생기지 않는다.
 *
 * 허용 범위는 RichTextEditor 의 확장(StarterKit / Image / Link / TextAlign / Table)이
 * 실제로 만들어내는 마크업을 기준으로 잡았다. 여기에 없는 태그·속성은 조용히 제거된다.
 */

import sanitizeHtmlLib from 'sanitize-html'

/** 표 셀에서 쓰는 속성 — TipTap Table 이 colwidth 를 직접 붙인다 */
const CELL_ATTRS = ['colspan', 'rowspan', 'colwidth', 'style']

const OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    // 블록
    'p', 'div', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    // 인라인
    'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup', 'span', 'a',
    // 미디어
    'img',
    // 표
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
    'colgroup', 'col',
  ],

  allowedAttributes: {
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'style'],
    td: CELL_ATTRS,
    th: CELL_ATTRS,
    col: ['span', 'style'],
    table: ['style'],
    // 나머지 태그는 정렬(style)만 허용
    '*': ['style'],
  },

  /**
   * style 속성은 통째로 열지 않고 값까지 검증한다.
   * (이전 DOMPurify 설정은 style 을 전부 허용했으므로 여기서 오히려 좁아진다)
   */
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/],
    },
    table: { width: [/^\d+(\.\d+)?(px|%)$/] },
    col: { width: [/^\d+(\.\d+)?(px|%)$/] },
    td: { width: [/^\d+(\.\d+)?(px|%)$/] },
    th: { width: [/^\d+(\.\d+)?(px|%)$/] },
    img: {
      width: [/^\d+(\.\d+)?(px|%)$/],
      height: [/^\d+(\.\d+)?(px|%)$/],
    },
  },

  // http(s)·mailto·tel 과 사이트 내부 경로만 허용 → javascript: 등은 제거된다
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowProtocolRelative: false,

  // 새 탭 링크의 탭내빙(tabnabbing) 방지 — target 이 있으면 rel 을 강제한다
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target) {
        attribs.rel = 'noreferrer noopener'
      }
      return { tagName, attribs }
    },
  },
}

/** 저장 전 HTML 정제. 빈 값은 빈 문자열로 통일. */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeHtmlLib(html, OPTIONS)
}
