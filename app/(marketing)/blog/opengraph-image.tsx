import { renderBlogOgImage, ogImageSize, ogContentType } from './_og'

export const size = ogImageSize
export const contentType = ogContentType
export const alt = 'ARC PEM Blog'

export default async function Image() {
  return renderBlogOgImage({
    title: 'Practical guides on BOQ, GST and contractor billing for Indian builders',
    category: 'ARC PEM Blog',
  })
}
