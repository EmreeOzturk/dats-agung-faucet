import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { claimTokens } from '@/action'



export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        // Get client IP from headers
        const headersList = headers()
        const clientIp = headersList.get('x-forwarded-for') || request.ip || 'unknown'
        
        // Get form data from request
        const formData = await request.formData()
        
        // Call claimTokens with the client IP
        const result = await claimTokens(
            { success: false }, 
            formData,
            clientIp
        )
        
        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 400 }
        )
    }
}

// Optionally add a GET method to check claim status
export async function GET(request: NextRequest) {
    const address = request.nextUrl.searchParams.get('address')
    const clientIp = headers().get('x-forwarded-for') || request.ip || 'unknown'
    
    if (!address) {
        return NextResponse.json(
            { success: false, message: 'Address is required' },
            { status: 400 }
        )
    }

    return NextResponse.json({
        success: true,
        message: 'API endpoint operational',
        ip: clientIp,
        address: address
    })
}