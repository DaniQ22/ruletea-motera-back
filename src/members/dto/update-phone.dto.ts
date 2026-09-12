import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdatePhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s()]{7,20}$/, {
    message: 'Ingresa un número de teléfono válido.',
  })
  phone: string;
}
