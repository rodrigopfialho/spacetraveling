import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import Link from 'next/link'
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';
import { useMemo } from 'react';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  nextPost: Post | null;
  prevPost: Post | null;
  preview: boolean;
  post: Post;
}

export default function Post({ post, preview, prevPost, nextPost }: PostProps): JSX.Element {
  const router = useRouter();

  const editPost = useMemo(() => {
    if (router.isFallback) {
      return false
    }

    return post.last_publication_date !== post.first_publication_date;
  }, [router.isFallback])

  const totalWords = post.data.content.reduce((sumWords, content) => {
    const contentText = RichText.asText(content.body);
    const arrayWords = contentText.split(' ').filter(text => text !== '');

    return sumWords + arrayWords.length;
  }, 0);

  if (router.isFallback) {
    return <div className={commonStyles.container}>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <img src={post.data.banner.url} alt="Banner" className={styles.banner} />
      <div className={commonStyles.container}>
        <h2 className={`${commonStyles.heading} ${styles.title}`}>
          {post.data.title}
        </h2>
        <div className={styles.details}>
          <span>
            <FiCalendar />
            {format(new Date(post.first_publication_date), 'd MMM yyyy', {
              locale: ptBR,
            })}
          </span>
          <span>
            <FiUser />
            {post.data.author}
          </span>
          <span>
            <FiClock />
            {`${Math.ceil(totalWords / 200)} min`}
          </span>

          {editPost && (
            <p>
              * editado em
              {format(new Date(post.last_publication_date), " d MMM yyyy', às 'HH:mm'", {
                locale: ptBR
              })}
            </p>
          )}

        </div>

        {post.data.content.map(content => (
          <div key={content.heading} className={styles.content}>
            <h3>{content.heading}</h3>
            <div
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </div>
        ))}

        <footer className={styles.prevNext}>
          <div>
            {prevPost && (
              <Link href={`/post/${prevPost.uid}`}>
                <a>
                  <h2>{prevPost.data.title}</h2>
                  <span>Post anterior</span>
                </a>
              </Link>
            )}
          </div>
          <div className={styles.next}>
             { nextPost && (
                <Link href={`/post/${nextPost.uid}`}>
                <a>
                  <h2>{nextPost.data.title}</h2>
                  <span>Próximo post</span>
                </a>
              </Link>
             )}
          </div>
          
        </footer>
        <Comments />
        
          <aside className={commonStyles.exitPreview}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
      
      </div>
      
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: response.data,
  };

  
  const prevPost = (
    await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
      fetch: ['posts.title'],
    })
  ).results[0];

  const nextPost = (
    await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date desc]',
      fetch: ['posts.title'],
    })
  ).results[0];

  return {
    props: {
      post,
      prevPost: prevPost ?? null,
      nextPost: nextPost ?? null,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};