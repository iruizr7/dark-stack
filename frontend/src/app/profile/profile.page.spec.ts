import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProfilePage } from './profile.page';
import { AuthService } from '../shared/services/auth.service';
import { ExampleProfile, ExampleProfileService } from '../shared/services/jsonapi-services/example-profile.service';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let authService: jasmine.SpyObj<AuthService>;
  let exampleProfileService: jasmine.SpyObj<ExampleProfileService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);
    authService.isAuthenticated.and.returnValue(true);

    const profile = new ExampleProfile();
    profile.id = '1';
    profile.attributes.email = 'profile@example.com';
    profile.attributes.first_name = 'Ada';
    profile.attributes.last_name = 'Lovelace';
    profile.attributes.profile_photo = 'http://localhost:8000/media/avatar.avif';

    exampleProfileService = jasmine.createSpyObj<ExampleProfileService>('ExampleProfileService', [
      'fetchCurrentProfile',
      'saveProfile',
    ]);
    exampleProfileService.fetchCurrentProfile.and.resolveTo(profile);
    exampleProfileService.saveProfile.and.callFake(async (resource) => resource);

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ExampleProfileService, useValue: exampleProfileService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the authenticated profile into the form', () => {
    expect(exampleProfileService.fetchCurrentProfile).toHaveBeenCalled();
    expect(component['profileForm'].getRawValue()).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    expect(fixture.nativeElement.textContent).toContain('User Profile');
  });
});
