export interface QuizOption {
  option_id: number
  question_id: number
  option_text: string
  is_correct: number
  created_date: string
  modified_date: string
}

export interface QuizQuestion {
  question_id: number
  question: string
  options: QuizOption[]
}

export interface Prize {
  image: string | undefined
  image_url: any
  prize_id: number
  title: string
  reward_type: string
  reward_value: string
  min_score: number
  max_score: number
  status: number
  created_date: string
  modified_date: string
}

export interface QuizResult {
  score: number
  total_questions: number
  reward?: {
    prize_id: number
    title: string
    reward_type: string
    reward_value: string
    image: string | undefined
    coins: number
  }
}