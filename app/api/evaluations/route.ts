import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('Supabase URL present:', !!supabaseUrl)
    console.log('Supabase Key present:', !!supabaseAnonKey)

    if (!supabaseUrl || !supabaseAnonKey) {
      const errorMsg = `Missing: ${!supabaseUrl ? 'URL' : ''} ${!supabaseAnonKey ? 'KEY' : ''}`
      console.error(errorMsg)
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration', details: errorMsg }),
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { error, data: insertedData } = await supabase
      .from('evaluations')
      .insert([data])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return new Response(
        JSON.stringify({ error: error.message, code: error.code }),
        { status: 400 }
      )
    }

    console.log('Data inserted successfully:', insertedData)
    return new Response(
      JSON.stringify({ success: true, data: insertedData }),
      { status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('API error:', errorMessage)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500 }
    )
  }
}
