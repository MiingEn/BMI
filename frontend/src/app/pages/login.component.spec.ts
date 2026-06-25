import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    apiService = jasmine.createSpyObj<ApiService>(
      'ApiService',
      ['login', 'register']
    );

    authService = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['setSession']
    );

    router = jasmine.createSpyObj<Router>(
      'Router',
      ['navigate']
    );

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: ApiService, useValue: apiService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should not call login API when form is invalid', () => {
    component.form.setValue({
      username: 'ab',
      password: '123'
    });

    component.login();

    expect(apiService.login).not.toHaveBeenCalled();
    expect(component.form.controls.username.touched).toBeTrue();
    expect(component.form.controls.password.touched).toBeTrue();
  });

  it('should login and redirect a valid user to the user dashboard', () => {
    const response = {
      token: 'test-token',
      username: 'heng',
      role: 'ROLE_USER'
    };

    apiService.login.and.returnValue(of(response));

    component.form.setValue({
      username: 'heng',
      password: 'secret123'
    });

    component.login();

    expect(apiService.login)
      .toHaveBeenCalledOnceWith('heng', 'secret123');

    expect(authService.setSession)
      .toHaveBeenCalledWith(response);

    expect(router.navigate)
      .toHaveBeenCalledWith(['/user']);
  });
});
