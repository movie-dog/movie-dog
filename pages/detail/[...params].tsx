import { useEffect, useState } from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Image from 'next/image';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/fbase';
import { getAuth } from 'firebase/auth';

import styled from 'styled-components';

import ConfirmButton from '@/components/buttons/ConfirmButton';
import MovieReviewSwiper from '@/components/swiper/ReviewSwiper';
import MovieSwiper from '@/components/swiper/MovieSwiper';
import ReviewModal from '@/components/modal/ReviewModal';
import Modal from '@/components/modal/Modal';
import StarRating from '@/components/StarRating';

import useModal from '@/utils/useModal';

import { options } from '../api/data';

type LikedMovieTypes = {
  genres: { name: string; id: number }[];
  movieId: number;
  movieTitle: string;
  poster_path: string;
  release_date: string;
};

type MovieDataTypes = {
  id: number;
  title: string;
  original_title: string;
  genres: { name: string; id: number }[];
  overview: string;
  backdrop_path: string;
  poster_path: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
};

type CreditDataTypes = {
  cast: [{ name: string }];
  director: { name: string };
};

function Detail({
  params,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  const [, movieId] = params.params;

  const [movieData, setMovieData] = useState<MovieDataTypes | null>(null);
  const [creditData, setCreditData] = useState<CreditDataTypes | null>(null);

  const { modal: reviewModal, toggleModal: toggleReviewModal } =
    useModal('reviewModal');
  const [isLiked, setIsliked] = useState(false);
  const [likedMovies, setLikedMovies] = useState<LikedMovieTypes[]>([]);

  const getMovieDB = async () => {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?language=ko-KR`,
      options,
    );
    const json = await response.json();
    const {
      id,
      title,
      original_title,
      genres,
      overview,
      backdrop_path,
      poster_path,
      release_date,
      runtime,
      vote_average,
      vote_count,
    } = json;
    setMovieData({
      id,
      title,
      original_title,
      genres,
      overview,
      backdrop_path,
      poster_path,
      release_date,
      runtime,
      vote_average,
      vote_count,
    });
  };

  const getCreditList = async () => {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?language=ko-KR`,
      options,
    );
    const json = await response.json();
    const actorList = json.cast.slice(0, 8);
    const directorObject = json.crew.find((item: any) => {
      return Object.keys(item).find((key) => item[key] === 'Director');
    });
    const { name: directorName } = directorObject;
    setCreditData({ cast: actorList, director: directorName });
  };

  const handleReviewButton = () => {
    if (localStorage.getItem('userData')) {
      toggleReviewModal(reviewModal.isOpened);
    } else {
      alert('로그인이 필요한 서비스입니다.');
    }
  };

  const isLikedMovie = async () => {
    if (uid) {
      const docSnap = await getDoc(doc(db, 'likes', uid));
      const likedMoviesData = docSnap.data()?.likedMovies || [];

      setLikedMovies(likedMoviesData);

      const isMovieLiked = likedMoviesData.some(
        (item: any) => item.movieId === +movieId,
      );

      setIsliked(isMovieLiked);
    }
  };

  const handleLikeButton = async () => {
    if (uid) {
      if (isLiked) {
        // 찜목록에 있을 경우
        await updateDoc(doc(db, 'likes', uid), {
          likedMovies: likedMovies.filter((item) => item.movieId !== +movieId),
        });
        setIsliked(false);
        alert('찜목록에서 삭제되었습니다.');
      } else {
        // 찜목록에 추가
        if (likedMovies) {
          await setDoc(doc(db, 'likes', uid), {
            likedMovies: [
              ...likedMovies,
              {
                genres: movieData?.genres,
                movieId: movieData?.id,
                movieTitle: movieData?.title,
                poster_path: movieData?.poster_path,
                release_date: movieData?.release_date,
              },
            ],
          });
        } else {
          await setDoc(doc(db, 'likes', uid), {
            likedMovies: [
              {
                genres: movieData?.genres,
                movieId: movieData?.id,
                movieTitle: movieData?.title,
                poster_path: movieData?.poster_path,
                release_date: movieData?.release_date,
              },
            ],
          });
        }
        setIsliked(true);
        alert('찜목록에 추가되었습니다.');
      }
    } else {
      alert('로그인이 필요한 서비스입니다.');
    }
  };

  useEffect(() => {
    getMovieDB();
    getCreditList();
  }, [params]);

  // 새로고침해도 찜한 영화정보를 불러오는 로직
  useEffect(() => {
    const fetchData = async () => {
      await isLikedMovie();
    };
    fetchData();
  }, [uid, movieId, isLiked]);

  return (
    <>
      {movieData && (
        <ContentBlock>
          <Modal
            setIsOpened={() => toggleReviewModal(reviewModal.isOpened)}
            isOpened={reviewModal.isOpened}
          >
            <ReviewModal
              setIsOpened={() => toggleReviewModal(reviewModal.isOpened)}
              movieData={movieData}
            />
          </Modal>
          <DetailBlock>
            <PosterBlock>
              <Image
                src={`http://image.tmdb.org/t/p/w500${movieData.poster_path}`}
                alt={`${movieData.title}의 포스터`}
                fill
                sizes="(max-width: 768px) 50vw,(max-width: 1200px) 70vw"
                priority
                className="pc-tablet-img"
              />
              <Image
                src={`http://image.tmdb.org/t/p/w500${movieData.backdrop_path}`}
                alt={`${movieData.title}의 스틸컷`}
                fill
                sizes="(max-width: 768px) 50vw,(max-width: 1200px) 70vw"
                priority
                className="mobile-img"
              />
            </PosterBlock>
            <InfoBlock>
              <h1>{movieData.title}</h1>
              <p className="english-title">{movieData.original_title}</p>
              <RatingBlock>
                <StarRating
                  rating={Math.floor(movieData.vote_average)}
                  starSize={24}
                />
                <span>
                  {Math.floor((movieData.vote_average / 2) * 10) / 10 + '점'}(
                  {movieData.vote_count.toLocaleString() + '명 / TMBD 기준'})
                </span>
              </RatingBlock>
              <p>
                {movieData.release_date + ' 개봉'}・{movieData.runtime + '분'}・
                {movieData.genres.map(
                  (genre, i) =>
                    genre.name +
                    (i !== movieData.genres.length - 1 ? ', ' : ''),
                )}
              </p>
              <p>{'감독 : ' + creditData?.director}</p>
              <p>
                {`출연 : ${creditData?.cast.map((item) => ' ' + item.name)}`}
              </p>
              <p>{movieData.overview}</p>
              <div className="buttons">
                <ConfirmButton
                  text={isLiked ? '찜 해제' : '찜하기'}
                  icon={isLiked ? 'favorite-fill' : 'favorite'}
                  onClick={handleLikeButton}
                />
                <ConfirmButton
                  text="한 줄 평 작성"
                  icon="write"
                  onClick={handleReviewButton}
                />
              </div>
            </InfoBlock>
          </DetailBlock>
          <section>
            <h2>유저 한 줄 평</h2>
            <MovieReviewSwiper movieId={movieData.id} />
          </section>
          <section>
            <h2>비슷한 영화</h2>
            <MovieSwiper
              movieId={movieData.id}
              urlKey="similar"
              ranking={false}
            />
          </section>
        </ContentBlock>
      )}
    </>
  );
}

export default Detail;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;
  return {
    props: { params },
  };
};

const ContentBlock = styled.div`
  max-width: 1200px;
  padding-bottom: 100px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.black};

  @media (min-width: 600px) {
    padding: 100px 0;
  }

  section {
    margin-bottom: 50px;
  }

  section:last-child {
    margin-bottom: 0;
  }

  section h1 {
    font-weight: 700;
  }

  section h2 {
    margin-bottom: 20px;
    font-size: ${({ theme }) => theme.fontSize.headline2};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.brown9};
    text-align: center;
  }
`;

const DetailBlock = styled.section`
  display: flex;
  flex-flow: column;
  gap: 20px;

  @media (min-width: 600px) {
    flex-flow: row;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    padding: 0 20px;
  }
`;

const PosterBlock = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 50%; // 스틸컷 가로:세로 2:1비율

  .pc-tablet-img {
    display: none;
  }
  .mobile-img {
    display: block;
  }

  @media (min-width: 600px) {
    width: 33.33%;
    padding-bottom: 50%; // 포스터 가로:세로 2:3비율

    .pc-tablet-img {
      display: block;
    }

    .mobile-img {
      display: none;
    }
  }
`;

const InfoBlock = styled.div`
  padding: 0 20px;

  @media (min-width: 600px) {
    width: 66.66%;
    padding: 0;
  }

  h1 {
    font-size: ${({ theme }) => theme.fontSize.headline2};
  }

  & > * {
    margin: 8px 0;
  }

  .english-title {
    color: ${({ theme }) => theme.colors.gray1};
  }

  .buttons {
    display: flex;
    gap: 20px;
    margin-top: 20px;
  }
`;

const RatingBlock = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
`;
