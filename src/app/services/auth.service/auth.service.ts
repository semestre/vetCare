// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);

  async loginWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(this.auth, provider);
    const user = result.user;

    // Guarda algo simple en localStorage
    localStorage.setItem(
      'vetcare_user',
      JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isGoogle: true,
      })
    );

    return user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    localStorage.removeItem('vetcare_user');
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }
}
