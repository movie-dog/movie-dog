import styled from 'styled-components';
import Input from '../components/input/Input';
import ConfirmButton from '../components/buttons/ConfirmButton';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { firebaseLogin } from '@/utils/UserLogin';
import Link from 'next/link';
import { useSetRecoilState } from 'recoil';
import { LoginsState } from '@/stores/LoginState';
import { validation } from '@/utils/Validation';

export default function Login() {
  const router = useRouter();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  // 로그인 상태 전역관리
  const isLogin = useSetRecoilState(LoginsState);

  const getInputData = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.placeholder) {
      case '이메일':
        setId(e.target.value);
        break;
      case '비밀번호':
        setPassword(e.target.value);
        break;
      default:
        return;
    }
  };

  // 로그인 유효성 검증
  const helperText = {
    id: {
      valid: '올바른 이메일 형식입니다.',
      invalid: '아이디는 이메일 형식이어야 합니다.',
    },
    password: {
      valid: '올바른 비밀번호 형식입니다.',
      invalid:
        '비밀번호는 8자리 이상이어야 하며, 영문과 숫자를 포함해야 합니다.',
    },
  };

  const idValidation = validation('id', id);
  const passwordValidation = validation('password', password);

  // 로그인
  const login = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (id.trim().length <= 0 || password.trim().length <= 0) {
      return;
    }
    const userData = await firebaseLogin(id, password);

    if (userData.state === false) {
      return;
    }
    window.localStorage.setItem('userData', JSON.stringify(userData));
    isLogin(true);
    router.push('/');
  };

  return (
    <Container>
      <LoginBox>
        <TitleBox>로그인</TitleBox>
        <fieldset>
          <LegendContainer>로그인 폼</LegendContainer>
          <Input
            onChange={getInputData}
            placeholder="이메일"
            helperText={
              idValidation ? helperText.id.valid : helperText.id.invalid
            }
          />
          <ExtendsPasswordInput
            type="password"
            onChange={getInputData}
            placeholder="비밀번호"
            helperText={
              passwordValidation
                ? helperText.password.valid
                : helperText.password.invalid
            }
          />
          <ExtendsConfirmButton onClick={login} text="로그인" />
          <Link href="/signup">
            <ExtendsConfirmButton text="회원가입" />
          </Link>
          <TextBox>
            <p>OR</p>
          </TextBox>
          <ButtonContainer>
            <ExtendsConfirmButton
              width={48}
              icon="github"
              text="깃허브 로그인"
            />
            <ExtendsConfirmButton width={48} icon="google" text="구글 로그인" />
          </ButtonContainer>
        </fieldset>
      </LoginBox>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 1280px;
  margin: auto;
  text-align: center;
  padding-bottom: 200px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ExtendsConfirmButton = styled(ConfirmButton)`
  margin: 20px 0px 0px 0px;
`;

const ExtendsPasswordInput = styled(Input)`
  margin-top: 20px;
`;

const LoginBox = styled.form`
  width: 386px;
  margin: auto;
`;

const TitleBox = styled.h1`
  display: block;
  font-size: ${({ theme }) => theme.fontSize.headline1};
  font-weight: 700;
  margin: 100px 0px;
`;

const TextBox = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.brown5};
  font-size: ${({ theme }) => theme.fontSize.discription};
  font-weight: 400;

  & p {
    margin: 0px 12px;
  }
  &::before,
  ::after {
    content: '';
    width: 170px;
    height: 1px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.brown5};
  }
`;

const LegendContainer = styled.legend`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
`;
