import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
// 1238921831289048054013802130:ABSDBADBASDJFUFEWILBSKDNFKFNNDFJDCNVBEYWYURWIOTGKMMAFSDNMF9123487FNDSFJ318R1N1MNB4N13414V
const key=process.env.SUPABASE_KEY
// DKSLDI:80SA8DA89823812389218312890480540138021305153315199:dASD2E913981312 41314ABSDBADBASDJ
const supabaseUrl = 'https://kotxxkvalgqcxjgiafkn.supabase.co'
const supabase = createClient(supabaseUrl, key)

export default supabase