import { TestBed, inject } from '@angular/core/testing';

import { CurrentConversationService } from './current-conversation.service';

describe('CurrentConversationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrentConversationService]
    });
  });

  it('should ...', inject([CurrentConversationService], (service: CurrentConversationService) => {
    expect(service).toBeTruthy();
  }));
});
