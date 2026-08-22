export function GET() {
  const body =
    "name,invite_name,type,invited_to,invited_count,phone\nAndi,Bapak Andi & Ibu Sari,vip,both,2,\nSari,,regular,reception,1,\n";
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="guests-template.csv"',
    },
  });
}
