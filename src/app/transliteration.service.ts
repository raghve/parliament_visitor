import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class TransliterationService {
  constructor() {}

  // Make transliterate method async
  async transliterate(text: string): Promise<Observable<string>> {
    if (!text) return of(text); // If no text, return the same value

    // Check if Google Transliteration API is already loaded
    if (this.isGoogleTransliterationApiLoaded()) {
      return this.performTransliteration(text); // If the API is loaded, perform transliteration
    } else {
      try {
        // If script is not loaded, load it dynamically and then perform transliteration
        await this.loadScript(); // Wait for the script to load
        return this.performTransliteration(text); // Proceed once the script is loaded
      } catch (error) {
        return new Observable<string>((observer) => {
          observer.error('Failed to load Google Transliteration API: ' + error);
        });
      }
    }
  }

  // Check if Google Transliteration API is loaded
  private isGoogleTransliterationApiLoaded(): boolean {
    return typeof google !== 'undefined' && google.elements && google.elements.transliteration;
  }

  // Dynamically load the Google Transliteration API script
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-transliteration-script')) {
        resolve(); // If already loaded, resolve immediately
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-transliteration-script';
      script.src = 'https://www.google.com/inputtools/request?text=abc'; // Google Transliteration API URL
      script.onload = () => resolve(); // Resolve once the script is loaded
      script.onerror = () => reject('Failed to load the Google Transliteration API script');
      document.body.appendChild(script); // Append the script to the body
    });
  }

  // Perform the transliteration once the script is loaded
  private performTransliteration(text: string): Observable<string> {
    return new Observable<string>((observer) => {
      if (!this.isGoogleTransliterationApiLoaded()) {
        observer.error('Google Transliteration API not loaded');
        return;
      }

      // Set up the transliteration control
      const transliterationControl = new google.elements.transliteration.TransliterationControl({
        sourceLanguage: 'en',
        destinationLanguage: 'hi',
        transliterationEnabled: true,
      });

      // Transliterate the text
      transliterationControl.transliterate([text], (transliteratedWords: string[]) => {
        observer.next(transliteratedWords.join(' ')); // Emit the transliterated text
        observer.complete(); // Complete the observable
      });
    });
  }
}


// declare var google: any;

// import { Injectable } from '@angular/core';
// import Sanscript from '@indic-transliteration/sanscript';

// @Injectable({
//   providedIn: 'root'
// })
// export class TransliterationService {

//   constructor() { }

//   transliterateToHindi(input: string): string {
//     // Use 'itrans' as the source scheme for English-like input
//     return Sanscript.t(input, 'itrans', 'devanagari');
//   }
// }
