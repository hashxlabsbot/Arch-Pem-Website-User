import type { MDXComponents } from 'mdx/types'

/** Custom renderers passed to <MDXRemote components={...}> — only overrides where the default HTML needs a wrapper or site-specific behaviour. */
export const mdxComponents: MDXComponents = {
  table: (props) => (
    <div className="tool-table-wrap">
      <table className="tool-table" {...props} />
    </div>
  ),
}
