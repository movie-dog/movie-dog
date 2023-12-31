import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useState } from 'react';
import { Genres, UserDataProps } from '@/utils/type/UserDataType';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/fbase';

function UserInfo({ likeArr = [], reviewArr }: UserDataProps) {
  const [userName, setUserName] = useState('');

  const getName = async (uid: string) => {
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((item) => {
      const result = item.data();
      setUserName(result.nickName);
    });
  };
  useEffect(() => {
    let data;
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData') as string;
      data = JSON.parse(userData);
    }
    const { uid } = data;
    getName(uid);
  }, []);

  const noPosterUrl = new URL('../../public/nooposter.png', import.meta.url)
    .href;

  let reviewCount = reviewArr.length == 0 ? '0' : `${reviewArr.length}`;
  let likeMovieCount = likeArr.length == 0 ? '0' : `${likeArr.length}`;

  const allData = [...reviewArr, ...likeArr];

  // allData에서 영화의 id를 중복되지 않게 가져오기
  const uniqueMovieIds = Array.from(
    new Set(allData.map((item) => item.movieId)),
  );

  // 각 uniqueMovieIds에 대한 첫 번째 데이터의 movieId와 genres 가져오기
  const result = uniqueMovieIds.map((movieId) => {
    const firstData = allData.find((item) => item.movieId === movieId);
    return {
      movieId: movieId,
      genres: firstData ? firstData.genres : [],
    };
  });

  const allGenres = result.flatMap((item) => item.genres);

  // 각 장르의 등장 횟수를 세어주는 함수
  const countGenres = (genres: Genres[]) => {
    const genreCount: { [key: string]: number } = {};

    genres.forEach((genre) => {
      const { name } = genre;
      genreCount[name] = (genreCount[name] || 0) + 1;
    });

    return genreCount;
  };

  // 모든 장르의 등장 횟수를 세기
  const genreCount = countGenres(allGenres);

  // 등장 횟수에 따라 장르를 내림차순으로 정렬
  const sortedGenres = Object.keys(genreCount).sort(
    (a, b) => genreCount[b] - genreCount[a],
  );

  // 정렬된 키를 기반으로 새로운 배열 생성
  const sortedGenreCount = sortedGenres.map((name) => ({
    name,
    count: genreCount[name],
  }));

  return (
    <UserInfoWrapper>
      <UserInfoBox>
        <LayoutBox>
          <TitleBox>{userName}님의 페이지</TitleBox>
          <FigureBox>
            <UserProfileImage src={noPosterUrl} alt="유저의 프로필 사진" />
            <UserProfielCapion>OOO님의 프로필 사진</UserProfielCapion>
          </FigureBox>
          <ul>
            <li>
              찜 해 둔 영화 :{' '}
              {parseInt(likeMovieCount) < 10
                ? `${likeMovieCount}`
                : likeMovieCount}
              개
            </li>
            <li>
              내가 쓴 한 줄 평 :{' '}
              {parseInt(reviewCount) < 10 ? `${reviewCount}` : reviewCount}개
            </li>
          </ul>
        </LayoutBox>
      </UserInfoBox>
      <UserGenres>
        <TitleBox>나의 선호 장르</TitleBox>
        <GenresListBox>
          {sortedGenreCount.length > 0 &&
            sortedGenreCount.map((item) => (
              <li key={item.name}>{item.name}</li>
            ))}
          {sortedGenreCount.length === 0 && <>
            <div>찜하기나 리뷰를 작성하여 선호하는 장르를 알아보세요</div>
          </>
          }
        </GenresListBox>
      </UserGenres>
    </UserInfoWrapper>
  );
}

export default UserInfo;

const UserInfoWrapper = styled.section`
  margin: auto;
  display: flex;
  gap: 20px;
  margin: auto;
  flex-direction: row;
  width: 83%;
  padding: 50px 20px 0px 20px;

  @media (max-width: 768px) {
    margin-top: 50px;
    width: 100%;
    padding: 0px;
    flex-direction: column;
  }
`;

const LayoutBox = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  margin: auto;
  margin-top: 32px;
  padding-left: 164px;
  p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  li {
    margin-top: 8px;
    font-size: ${({ theme }) => theme.fontSize.discription};
    font-style: normal;
    font-weight: 400;
    line-height: 150%;
    color: ${({ theme }) => theme.colors.brown9};
  }
`;
const UserInfoBox = styled.div`
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.brown5};
  background-color: ${({ theme }) => theme.colors.brown1};
  height: 189px;
  border-radius: 10px;
  width: 50%;

  @media (max-width: 768px) {
    width: 100%;
    margin: auto;
  }
`;
const UserGenres = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.brown5};
  background-color: ${({ theme }) => theme.colors.brown1};
  height: 189px;
  border-radius: 10px;
  @media (max-width: 768px) {
    width: 100%;
    margin: auto;
  }
  width: 50%;

  h2 {
    margin-top: 32px;
    margin-left: 32px;
  }
`;

const GenresListBox = styled.ul`
  margin-left: 32px;
  margin-top: 16px;
  width: calc(100% - 64px);
  display: flex;
  flex-wrap: wrap;
  gap: 16px 12px;
  overflow: auto;
  max-height: 100px;
  li {
    font-size: ${({ theme }) => theme.fontSize.discription};
    color: ${({ theme }) => theme.colors.brown5};
    display: inline-block;
    padding: 4px 12px;
    line-height: 150%;
    border-radius: 4px;
    border: 1px solid var(--brown-5, #c58555);
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.3);
  }
`;

const FigureBox = styled.figure`
  position: absolute;
  left: 32px;
  top: 45px;
`;
const UserProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
`;
const UserProfielCapion = styled.figcaption`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip-path: polygon(0 0, 0 0, 0 0);
`;
const TitleBox = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.headline2};
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;
