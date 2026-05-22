import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "没有收到图片" }, { status: 400 });
    }

    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      },
      body: JSON.stringify({
        model: "Qwen/Qwen3-VL-32B-Instruct",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: `你是一位专业的AI形象顾问，擅长分析东亚女性面部特征并给出风格建议。
请用中文回复，严格按照以下JSON格式输出，不要输出任何其他内容：
{
  "styleType": "风格类型名称（如：清冷少女、知性优雅、甜美活力、御姐气场、温柔仙气、复古文艺）",
  "keywords": ["气质词1", "气质词2", "气质词3"],
  "description": "100字左右的风格描述，可以提及接近某种古典或影视形象的气质，语气要像朋友聊天，温暖有共鸣",
  "makeupTips": {
    "daily": "日常妆容建议，30字左右",
    "date": "约会妆容建议，30字左右",
    "work": "职场妆容建议，30字左右",
    "party": "派对妆容建议，30字左右"
  },
  "colorPalette": ["适合的颜色1", "适合的颜色2", "适合的颜色3"]
}`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: image,
                  detail: "high",
                },
              },
              {
                type: "text",
                text: "请分析这张照片中人物的面部特征，给出专属风格档案。",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("硅基流动 API 错误：", err);
      return NextResponse.json(
        { error: "AI 分析失败，请稍后重试" },
        { status: 500 }
      );
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI 返回格式有误，请重试" },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error("服务器错误：", err);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}