export function GET() {
  const body = "name,type,invited_count,phone\nAndi,vip,2,\nSari,regular,1,\n";
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="guests-template.csv"',
    },
  });
}
