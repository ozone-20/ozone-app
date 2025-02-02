import { createClient } from '@supabase/supabase-js'

const supaUrl = "https://eyslrmwmvaubiprgyeqt.supabase.co"
const supaKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5c2xybXdtdmF1Ymlwcmd5ZXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NzM0MzcsImV4cCI6MjA0NjE0OTQzN30.zMtvV84UQgipCXa8hP9Q_BHYP3eLsAj04XygKhatjjk"

export const supabase = createClient(supaUrl, supaKey)
