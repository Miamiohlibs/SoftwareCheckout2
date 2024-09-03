import adobeConf from '../../../../../config/adobe';
import AdobeRepository from '../../repositories/AdobeRepository';
const adobe = new AdobeRepository(adobeConf);
import { NextResponse } from 'next/server';

export async function GET(request) {
  let group = request.nextUrl.searchParams.get('group');
  let members = await adobe.getGroupMembers(group);
  return NextResponse.json({
    members,
  });
}
