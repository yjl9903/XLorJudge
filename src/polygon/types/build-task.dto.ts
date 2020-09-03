import {
  isDefined,
  IsDefined,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

class CodeDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  lang: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}

export class BuildTaskDto {
  @IsNotEmpty()
  @IsString()
  taskId: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => CodeDto)
  checker: CodeDto;

  @ValidateIf(o => isDefined(o.validator))
  @ValidateNested()
  @Type(() => CodeDto)
  validator: CodeDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => CodeDto)
  correctSolution: CodeDto;

  @ValidateIf(o => isDefined(o.generators))
  @ValidateNested({ each: true })
  @Type(() => CodeDto)
  generators: CodeDto[];
}
