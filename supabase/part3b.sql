-- Run once in Supabase SQL editor. Stops the public review data from exposing the private storage path.
create or replace function public.get_review(p_slug text) returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'project', json_build_object('id',p.id,'name',p.name,'status',p.status,'revision_limit',p.revision_limit,
      'revisions_used',(select count(*) from revisions r where r.project_id=p.id)),
    'video', (select row_to_json(v) from (select id,version from videos where project_id=p.id order by version desc limit 1) v),
    'comments', coalesce((select json_agg(c order by c.timestamp_sec) from (select id,video_id,author_name,timestamp_sec,body,status,created_at,(user_id is null) as by_client from comments where project_id=p.id) c),'[]'::json),
    'approval', (select row_to_json(a) from (select approved_by,approved_at from approvals where project_id=p.id) a))
  from projects p where p.review_slug = p_slug $$;
