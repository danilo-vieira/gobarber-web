import React from 'react';

import { render, fireEvent, wait } from '@testing-library/react';
import AxiosMock from 'axios-mock-adapter';

import api from '../../services/api';
import SignUp from '../../pages/SignUp';

const apiMock = new AxiosMock(api);

const mockedHistoryPush = jest.fn();
const mockedAddToast = jest.fn();

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('../../hooks/toast', () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

describe('Sign up page', () => {
  it('should be able to sign up', async () => {
    apiMock.onPost('/users').reply(201, {
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const nameInputElement = getByPlaceholderText('Nome');
    const emailInputElement = getByPlaceholderText('E-mail');
    const passwordInputElement = getByPlaceholderText('Senha');

    const submitButtonElement = getByText('Cadastrar');

    fireEvent.change(nameInputElement, { target: { value: 'John Doe' } });
    fireEvent.change(emailInputElement, {
      target: { value: 'johndoe@example.com' },
    });
    fireEvent.change(passwordInputElement, { target: { value: '123456' } });

    fireEvent.click(submitButtonElement);

    await wait(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith('/');
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        }),
      );
    });
  });
});
