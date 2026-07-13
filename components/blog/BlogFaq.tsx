type FaqItem = { q: string; a: string }

export default function BlogFaq({ items }: { items: FaqItem[] }) {
  return (
    <>
      <h2>Frequently asked questions</h2>
      <div className="post-faq">
        {items.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <div className="faq-a">{f.a}</div>
          </details>
        ))}
      </div>
    </>
  )
}
