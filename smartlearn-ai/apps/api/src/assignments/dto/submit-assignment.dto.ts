import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitAssignmentDto {
  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;
}
