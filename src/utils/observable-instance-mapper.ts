import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import { map, Observable } from 'rxjs';

export class ObservableInstanceMapper {
  static valueToInstance<T>(plain$: Observable<any>, cls: ClassConstructor<T>): Observable<T> {
    return plain$.pipe(map((value) => plainToInstance(cls, value)));
  }

  static valuesToInstance<T>(plain$: Observable<any[]>, cls: ClassConstructor<T>): Observable<T[]> {
    return plain$.pipe(map((value) => plainToInstance(cls, value)));
  }
}
