import styled from 'styled-components';
import Input from '../components/input/Input';
import ConfirmButton from '../components/buttons/ConfirmButton';

export default function SignUp() {
  return (
    <Container>
      <LoginBox>
        <Title>회원가입</Title>
        <IdCheckBox>
        <ExtendsEmailInput state='default' placeholder='아이디(이메일 주소)' helperText="아이디는 이메일 형식이어야 합니다."/>
        <ExtendsConfirmButton  width={23} text='중복확인'/>
        </IdCheckBox>
        <ExtendsDefaultInput state='default' placeholder='닉네임' helperText="닉네임은 2자 이상 8자 이하의 한글, 영문, 숫자로 이루어져야 합니다."/>
        <ExtendsDefaultInput state='default' placeholder='비밀번호' helperText="비밀번호는 8자리 이상이어야 하며, 영문과 숫자를 포함해야 합니다."/>
        <ExtendsDefaultInput state='default' placeholder='비밀번호 확인' helperText="비밀번호를 한번 더 입력해주세요."/>
      <ConfirmButton text="회원가입" disabled />
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
  padding-bottom: 207px;
`;

const LoginBox = styled.div`
  width: 386px;
  margin: auto;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.headline1};
  font-weight: 700;
  margin: 100px 0px;
`;

const IdCheckBox = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ExtendsEmailInput = styled(Input)`
width: 300px;
margin-bottom: 10px;
`;

const ExtendsDefaultInput = styled(Input)`
margin-bottom: 10px;
`;

const ExtendsConfirmButton = styled(ConfirmButton)`
  margin-top: 0px;
  margin-right: 0px;
  margin-left: 8px;
`;