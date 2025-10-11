import { TestBed } from '@angular/core/testing';

import { PropetarioService } from './propetario.service';

describe('PropetarioService', () => {
  let service: PropetarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropetarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
