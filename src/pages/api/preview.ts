import { Document } from '@prismicio/client/types/documents';
// import { NextApiRequest, NextApiResponse } from 'next';
// import { linkResolver } from '../prismicConfiguration' // import from wherever this is set
import {getPrismicClient as Client } from '../../services/prismic'  // import from wherever this is set

function linkResolver(doc: Document): string {
    if(doc.type === 'posts') {
        return `/post/${doc.uid}`
    }
}

export default async (req, res) => {
    const { token: ref, documentId } = req.query;
    const redirectUrl = await Client(req)
      .getPreviewResolver(ref, documentId)
      .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref });

  res.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
    <script>window.location.href = '${redirectUrl}'</script>
    </head>`
  );
  res.writeHead(302, { LOcation: `${redirectUrl}` });
  res.end();
};