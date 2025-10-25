export interface SocialFact {
  fact_id: number
  fact_text: string
  icon_url: string
  sort_order: number
  status: number
  created_date: string
}

export interface Testimonial {
  testimonial_id: number
  user_id: number
  user_name: string
  message: string
  image_url: string
  created_date: string
  status: number
}

export interface Prize {
  price_img: string
  prize_id: number
  month: string
  position: number
  prize_title: string
  prize_details: string
  status: number
  created_date: string
}

export interface Ticket {
  ticket_id: number
  user_id: number
  ticket_number: string
  draw_month: string
  status: number
  created_date: string
}

export interface DrawResult {
  result_id: number
  draw_month: string
  winning_ticket_1: string
  "1stprize": number
  winning_ticket_2: string
  "2ndprize": number
  winning_ticket_3: string
  "3rdprize": number
  created_date: string
}

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}