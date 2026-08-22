import { deleteComment } from "@/app/admin/actions";
import { AdminShell, SetupNotice } from "@/components/admin/AdminUi";
import { listComments } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export default async function CommentsAdminPage() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const comments = await listComments();

  return (
    <AdminShell title="Guestbook">
      <ul className="space-y-3">
        {comments.length === 0 ? (
          <li className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
            No wishes yet.
          </li>
        ) : (
          comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{comment.name}</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {comment.message}
                  </p>
                </div>
                <form action={deleteComment}>
                  <input type="hidden" name="id" value={comment.id} />
                  <button className="text-sm text-red-600">Delete</button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
    </AdminShell>
  );
}
