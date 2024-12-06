import { Pipe, PipeTransform } from '@angular/core';
import { TransliterationService } from './transliteration.service';
import { Observable, of } from 'rxjs';

@Pipe({
  name: 'googleTransliterate',
  standalone: true,
})
export class GoogleTransliterationPipe implements PipeTransform {
  constructor(private transliterationService: TransliterationService) {}

  // Pipe transforms the input text into the transliterated version.
  transform(value: string): Observable<string> {
    if (!value) return of(value); // Return the same value if the input is empty or null

    // Call transliterateText and return the observable result
    return this.transliterateText(value);
  }

  // Handle transliteration call and await the result
  private transliterateText(text: string): Observable<string> {
    return new Observable<string>((observer) => {
      this.transliterationService
        .transliterate(text)
        .then((transliteratedTextObservable) => {
          // Subscribe to the transliterated Observable and emit the values
          transliteratedTextObservable.subscribe(
            (transliteratedText) => observer.next(transliteratedText),
            (error) => observer.error(error),
            () => observer.complete()
          );
        })
        .catch((error) => {
          // Handle the error and return the original text if there's an error
          observer.error('Error during transliteration: ' + error);
        });
    });
  }
}
