import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return new NextResponse("Missing email or password", { status: 400 })
    }

    const exists = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (exists) {
      return new NextResponse("User already exists", { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("REGISTRATION ERROR:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 })
  }
}
