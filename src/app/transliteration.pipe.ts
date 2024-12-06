import { Pipe, PipeTransform } from '@angular/core';
import Sanscript from '@indic-transliteration/sanscript';

@Pipe({
  name: 'transliterate1',
  standalone: true, // Make it standalone
})
export class TransliterationPipe implements PipeTransform {
  transform(value: string, targetScript: string = 'devanagari'): string {
    if (!value) return value;
    return Sanscript.t(value, 'itrans', targetScript);
  }
}
