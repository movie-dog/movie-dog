import { db } from '@/fbase';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ChangeEvent, useEffect, useState } from 'react';
import styled from 'styled-components';

import ConfirmButton from '../buttons/ConfirmButton';
import StarRating from '../StarRating';

type ReviewModalTypes = {
  movieId: number;
  movieTitle: string;
  setIsOpened: React.Dispatch<React.SetStateAction<boolean>>;
};

type ExistReviewTypes = {
  reviewId: string;
  content: string;
  movieId: number;
  movieTitle: string;
  rating: number;
  userNickName: string;
};

function ReviewModal({ movieId, movieTitle, setIsOpened }: ReviewModalTypes) {
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [existReview, setExistReview] = useState<ExistReviewTypes>();
  const uid = JSON.parse(localStorage.getItem('userData') || '{}').uid;

  // textarea value 상태 관리
  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (reviewText.length > 99) {
      setReviewText(e.target.value.substring(0, 99));
      return;
    }
    setReviewText(e.target.value);
  };

  // 기존 리뷰가 있을 경우 불러오는 로직
  const loadExistReview = async () => {
    const q = query(collection(db, 'reviews'), where('movieId', '==', movieId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setExistReview({
        reviewId: doc.id,
        content: doc.data().content,
        movieId: doc.data().movieId,
        movieTitle: doc.data().movieTitle,
        rating: doc.data().rating,
        userNickName: doc.data().userNickName,
      });
      setReviewText(doc.data().content);
      setReviewRating(doc.data().rating);
    });
  };

  // 리뷰 작성 및 업데이트 로직
  const submitReview = async () => {
    // 유저 닉네임 가져오기
    let userNickName;
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      userNickName = doc.data().nickName;
    });

    // 이미 작성된 리뷰가 있을 경우 나눠지는 로직
    if (existReview) {
      alert('리뷰가 수정되었습니다.');
      await updateDoc(doc(db, 'reviews', existReview.reviewId), {
        content: reviewText,
        rating: reviewRating,
        userNickName,
      });
    } else {
      alert('리뷰가 작성되었습니다.');
      await addDoc(collection(db, 'reviews'), {
        content: reviewText,
        movieId,
        movieTitle,
        rating: reviewRating,
        uid,
        userNickName,
      });
    }
    setIsOpened(false);
    location.reload();
  };

  useEffect(() => {
    loadExistReview();
  }, []);

  return (
    <>
      <TitleBlock>&lt;{movieTitle}&gt;의 한 줄 평</TitleBlock>
      <StarRating
        rating={reviewRating || 0}
        readonly={false}
        setReviewRating={setReviewRating}
        starSize={20}
      />
      <p>{`(${reviewRating / 2} 점)`}</p>
      <TextBlock
        placeholder="해당 영화의 한 줄 평을 입력해주세요."
        onChange={onChange}
        value={reviewText}
      />
      <LengthBlock>{reviewText.length}/100</LengthBlock>
      <ConfirmButton
        text={existReview?.content ? '수정' : '작성'}
        onClick={submitReview}
        disabled={!reviewText}
      />
    </>
  );
}

export default ReviewModal;

const TitleBlock = styled.h3`
  margin-bottom: 8px;
  font-size: ${({ theme }) => theme.fontSize.headline3};
  color: ${({ theme }) => theme.colors.black};
  font-weight: 700;
`;

const TextBlock = styled.textarea`
  width: 100%;
  height: 10rem;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid ${({ theme }) => theme.colors.gray1};
  resize: none;
`;

const LengthBlock = styled.p`
  margin-bottom: 8px;
  text-align: right;
`;