import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateKeywordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(40)
  keyword: string;
}
