import Link from 'next/link';
import styled from 'styled-components';

export default function Footer() {
  return (
    <Container>
      <List>
        <ListItem>MOVIE DOG</ListItem>
        <ListItem>
          Github -{' '}
          <Link href="https://github.com/hardy-is-cat">hardy-is-cat</Link>,{' '}
          <Link href="https://github.com/lulla-by">lulla-by</Link>
        </ListItem>
        <ListItem>
          영화 DB 제공 -{' '}
          <Link href="https://developer.themoviedb.org/docs">TMDB</Link>
        </ListItem>
      </List>
    </Container>
  );
}

const Container = styled.footer`
  background-color: ${({ theme }) => theme.colors.brown8};
  width: 100%;
  padding: 50px 0;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  max-width: 1200px;
  padding: 0 20px;
  margin: 0 auto;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const ListItem = styled.li`
  color: ${({ theme }) => theme.colors.brown1};
  font-size: ${({ theme }) => theme.fontSize.discription};
  font-weight: 400;

  a {
    color: inherit;
  }

  &:first-child {
    font-size: ${({ theme }) => theme.fontSize.headline2};
    font-weight: 800;
  }
`;
