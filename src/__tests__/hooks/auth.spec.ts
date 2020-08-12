import { renderHook, act } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';

import { useAuth, AuthProvider } from '../../hooks/auth';

import api from '../../services/api';

const apiMock = new MockAdapter(api);

describe('Auth hook', () => {
  it('should be able to sign in', async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const apiMockResponse = {
      user: {
        email: 'johndoe@example.com',
      },
      token: 'jwt-token',
    };

    apiMock.onPost('sessions').reply(204, apiMockResponse);

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: 'johndoe@example.com',
      password: '123456',
    });

    await waitForNextUpdate();

    expect(setItemSpy).toHaveBeenCalledWith(
      '@Gobarber:user',
      JSON.stringify(apiMockResponse.user),
    );
    expect(setItemSpy).toHaveBeenCalledWith(
      '@Gobarber:token',
      apiMockResponse.token,
    );

    expect(result.current.user.email).toEqual('johndoe@example.com');
  });

  it('should restore saved data from storage when auth inits', () => {
    const getItemSpy = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(key => {
        switch (key) {
          case '@Gobarber:user':
            return JSON.stringify({
              email: 'johndoe@example.com',
            });

          case '@Gobarber:token':
            return 'jwt-token';

          default:
            return null;
        }
      });

    const { result } = renderHook(useAuth, {
      wrapper: AuthProvider,
    });

    expect(result.current.user.email).toBe('johndoe@example.com');
    expect(getItemSpy).toHaveBeenCalledWith('@Gobarber:user');
    expect(getItemSpy).toHaveBeenCalledWith('@Gobarber:token');
  });

  it('should be able to sign out', async () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

    const { result } = renderHook(useAuth, {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.signOut();
    });

    expect(removeItemSpy).toHaveBeenCalledWith('@Gobarber:user');
    expect(removeItemSpy).toHaveBeenCalledWith('@Gobarber:token');
  });

  it('should be able to update user data', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const user = {
      id: 'test-id',
      name: 'John Doe',
      email: 'john-doe@example.com',
      avatar_url: 'image-jest.jpg',
    };

    const { result } = renderHook(useAuth, {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.updateUser(user);
    });

    expect(setItemSpy).toHaveBeenCalledWith(
      '@Gobarber:user',
      JSON.stringify(user),
    );
    expect(result.current.user.email).toEqual('john-doe@example.com');
  });
});
