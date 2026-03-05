// US-101: 테이블 자동 로그인 UI
import { screen, fireEvent, waitFor } from '@testing-library/react';
import SetupPage from '@/pages/SetupPage';
import { renderWithProviders, clearLocalStorage } from '@/test/helpers';

beforeEach(() => clearLocalStorage());

describe('US-101: SetupPage — 테이블 자동 로그인', () => {
  it('매장 식별자, 테이블 번호, 비밀번호 입력 필드가 렌더링된다', () => {
    renderWithProviders(<SetupPage />);
    expect(screen.getByLabelText('매장 식별자')).toBeInTheDocument();
    expect(screen.getByLabelText('테이블 번호')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
  });

  it('설정 완료 버튼이 존재한다', () => {
    renderWithProviders(<SetupPage />);
    expect(screen.getByRole('button', { name: '설정 완료' })).toBeInTheDocument();
  });

  it('폼 제출 시 로딩 상태가 표시된다', async () => {
    renderWithProviders(<SetupPage />);
    fireEvent.change(screen.getByLabelText('매장 식별자'), { target: { value: 'test-store' } });
    fireEvent.change(screen.getByLabelText('테이블 번호'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: '설정 완료' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로그인 중...' })).toBeDisabled();
    });
  });

  it('로그인 성공 시 localStorage에 인증 정보가 저장된다', async () => {
    renderWithProviders(<SetupPage />);
    fireEvent.change(screen.getByLabelText('매장 식별자'), { target: { value: 'my-store' } });
    fireEvent.change(screen.getByLabelText('테이블 번호'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: '설정 완료' }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeTruthy();
      expect(localStorage.getItem('auth')).toBeTruthy();
      expect(localStorage.getItem('loginCredentials')).toBeTruthy();
    });
  });
});
