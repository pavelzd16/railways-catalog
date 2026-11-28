import { useId, useState } from "react";
import { Link } from "react-router";
import {
  FiArrowRight,
  FiChevronDown,
  FiChevronRight,
  FiGrid,
} from "react-icons/fi";
import { useCategories } from "@/entities/category/model/hooks/useCategories";
import { CategoryIcon } from "@/entities/category/ui/CategoryIcon";
import { getCategoryUrl } from "@/shared/lib/catalog-helpers";
import { groupCategories } from "@/shared/lib/category-groups";
import "./home-categories-sidebar.css";

export function HomeCategoriesSidebar() {
  const { categories, isLoading, error } = useCategories();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const panelId = useId();

  return (
    <aside
      aria-label="Каталог на главной странице"
      className="hero-catalog min-w-0 overflow-hidden rounded-lg border border-white/15 bg-foreground/65 text-white backdrop-blur-sm"
    >
      <h2 className="hidden min-h-11 items-center gap-2.5 px-4 py-2 text-base font-bold lg:flex">
        <FiGrid aria-hidden="true" className="h-[18px] w-[18px] text-accent" />
        Каталог
      </h2>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-2.5 text-left font-bold lg:hidden"
      >
        <span className="flex items-center gap-2">
          <FiGrid aria-hidden="true" className="h-5 w-5 text-accent" />
          Каталог материалов
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={`shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={panelId}
        className={`border-t border-white/15 ${open ? "block" : "hidden lg:block"}`}
      >
        <nav aria-label="Категории продукции" aria-busy={isLoading}>
          {isLoading ? (
            <div role="status" className="px-1.5 py-1">
              {Array.from({ length: 9 }, (_, index) => (
                <div
                  key={index}
                  className="flex min-h-11 animate-pulse items-center px-2.5 lg:min-h-8"
                >
                  <div className="h-3 w-3/4 rounded bg-white/15" />
                </div>
              ))}
              <span className="sr-only">Загрузка категорий</span>
            </div>
          ) : error ? (
            <p role="alert" className="px-4 py-4 text-sm text-white/70">
              Не удалось загрузить категории. Попробуйте открыть каталог.
            </p>
          ) : categories.length ? (
            <ul className="hero-catalog-list px-1.5 py-1">
              {groupCategories(categories).map(group => (
                <li key={group.id}>
                <details open={showAll || undefined}>
                  <summary className="min-h-11 cursor-pointer rounded-md px-2.5 py-3 text-sm font-bold hover:bg-white/8">{group.name}</summary>
                  <ul className="pl-2">
              {group.categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={getCategoryUrl(category.slug)}
                    className="hero-catalog-link group flex min-h-11 items-center gap-2 rounded-md border-l-2 border-transparent px-2.5 py-1.5 text-sm leading-5 text-white/90 transition-colors hover:border-accent hover:bg-white/8 hover:text-white lg:min-h-8 lg:py-1 lg:text-[13px] lg:leading-[18px]"
                  >
                    <CategoryIcon slug={category.slug} dark />
                    <span className="min-w-0 flex-1 break-words">
                      {category.name}
                    </span>
                    <FiChevronRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 text-white/45 transition-colors group-hover:text-accent"
                    />
                  </Link>
                </li>
              ))}
                  </ul>
                </details>
                </li>
              ))}
              <li><button type="button" onClick={() => setShowAll(!showAll)} aria-expanded={showAll} className="min-h-11 w-full px-2.5 py-2 text-left text-sm font-bold text-accent">{showAll ? 'Свернуть разделы' : `Показать все разделы (${categories.length})`}</button></li>
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-white/70">
              Категории пока недоступны.
            </p>
          )}
        </nav>
        <Link
          to="/catalog"
          className="flex min-h-11 items-center justify-between gap-3 border-t border-white/15 bg-white/4 px-4 py-2 text-sm font-bold text-accent transition-colors hover:bg-white/8 lg:min-h-10 lg:text-[13px]"
        >
          Весь каталог
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
