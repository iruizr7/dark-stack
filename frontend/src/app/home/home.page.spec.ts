import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePage } from './home.page';
import { ExampleMessageService } from '../shared/services/jsonapi-services/example-message.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let exampleMessageService: jasmine.SpyObj<ExampleMessageService>;

  beforeEach(async () => {
    exampleMessageService = jasmine.createSpyObj<ExampleMessageService>('ExampleMessageService', [
      'fetchPublishedMessages',
    ]);
    exampleMessageService.fetchPublishedMessages.and.resolveTo([
      {
        id: '1',
        title: 'JSON:API is ready',
        body: 'Loaded from the backend.',
        createdAt: '2026-03-22T12:00:00Z',
      },
    ]);

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        { provide: ExampleMessageService, useValue: exampleMessageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render sample messages loaded from the service', () => {
    const content = fixture.nativeElement.textContent;

    expect(exampleMessageService.fetchPublishedMessages).toHaveBeenCalled();
    expect(content).toContain('JSON:API is ready');
    expect(content).toContain('Loaded from the backend.');
  });
});
