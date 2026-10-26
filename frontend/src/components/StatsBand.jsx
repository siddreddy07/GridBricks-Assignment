// one bordered strip with the key numbers, split by dividers
// items: [{ label, value, note, valueClass }]
export default function StatsBand({ items }) {
  return (
    <dl className="grid grid-cols-2 rounded-md border border-rule bg-surface sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-rule">
      {items.map((item) => (
        <div key={item.label} className="px-5 py-4">
          <dt className="text-sm text-muted">{item.label}</dt>
          <dd className={`mt-1 text-2xl font-semibold ${item.valueClass || ""}`}>{item.value}</dd>
          {item.note && <dd className="mt-0.5 text-sm text-muted">{item.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
