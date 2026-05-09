import Link from "next/link";
import { fetchAllFilters } from "@/lib/product-filters";
import { fetchProductCategories } from "@/lib/products";
import FilterListClient from "./FilterListClient";
import { ensureColorFilter } from "./actions";

export const revalidate = 0;

export default async function AdminFiltersPage() {
  const [filters, categories] = await Promise.all([
    fetchAllFilters(),
    fetchProductCategories(),
  ]);

  const hasColorFilter = filters.some(
    (f) => f.category_id === null && f.key === "color",
  );

  // 카테고리별 그룹핑 (글로벌은 null 키)
  const groups = new Map<number | null, typeof filters>();
  for (const f of filters) {
    const key = f.category_id;
    const list = groups.get(key) ?? [];
    list.push(f);
    groups.set(key, list);
  }
  // 글로벌 + 카테고리 순서 보장
  const orderedKeys: (number | null)[] = [null, ...categories.map((c) => c.id)];
  for (const k of orderedKeys) if (!groups.has(k)) groups.set(k, []);

  const groupArray = orderedKeys.map((key) => ({
    key,
    title:
      key === null
        ? "전체 (모든 카테고리에 공통 적용)"
        : (categories.find((c) => c.id === key)?.name ?? `카테고리 #${key}`),
    items: groups.get(key) ?? [],
  }));

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">필터 관리</h1>
          <p className="mt-1 text-[0.875rem] text-neutral-500">
            제품안내 페이지 상단에 노출되는 필터를 카테고리별로 관리합니다. 좌측{" "}
            <span aria-hidden>⠿</span> 핸들이나 행을 드래그해서 순서를 바꿀 수
            있어요. 글로벌 필터는 모든 카테고리에 함께 노출됩니다.
          </p>
        </div>
        <Link
          href="/mng/filters/new"
          className="rounded-full bg-black px-4 py-2 text-[0.875rem] font-medium text-white hover:bg-neutral-800"
        >
          + 필터 추가
        </Link>
      </div>

      {!hasColorFilter && (
        <div className="mb-6 flex items-start gap-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 ring-1 ring-blue-200">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="13.5" cy="6.5" r=".5" />
              <circle cx="17.5" cy="10.5" r=".5" />
              <circle cx="8.5" cy="7.5" r=".5" />
              <circle cx="6.5" cy="12.5" r=".5" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[0.875rem] font-bold text-blue-900">
              색상 필터가 아직 없어요
            </p>
            <p className="mt-1 text-[0.875rem] leading-[1.7] text-blue-800">
              제품 등록 시 입력한 색상에서 옵션을 자동으로 합성하는{" "}
              <strong>글로벌 색상 필터</strong>를 한 번만 만들면 됩니다. 옵션을
              따로 관리할 필요가 없어요.
            </p>
            <form action={ensureColorFilter} className="mt-3">
              <button
                type="submit"
                className="rounded-full bg-blue-600 px-4 py-2 text-[0.875rem] font-bold text-white hover:bg-blue-700"
              >
                기본 색상 필터 생성하기
              </button>
            </form>
          </div>
        </div>
      )}

      <FilterListClient groups={groupArray} />
    </div>
  );
}
