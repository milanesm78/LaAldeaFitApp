export interface Exercise {
  id: string;
  name: string;
  youtube_url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseFormData {
  name: string;
  youtube_url: string;
}
