import Link from 'next/link';

export function Breadcrumb({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="面包屑">
      <ol className="breadcrumb">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.path}-${index}`}>
              {last ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <>
                  <Link href={item.path}>{item.name}</Link>
                  <span aria-hidden="true"> · </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
