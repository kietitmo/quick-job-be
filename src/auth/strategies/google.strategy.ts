import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID:
        '591061564634-7n3d63dtl42k371pbt3sojn6qddj93hn.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/auth/google/redirect',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = await this.authService.validateUserGoogle(profile);
    return user;
  }
}
