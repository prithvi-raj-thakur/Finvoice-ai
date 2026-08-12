import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);
const backendDir = path.resolve(process.cwd(), '../backend');

export async function GET() {
  try {
    // Run the python script to fetch escalations
    const { stdout } = await execPromise('uv run python src/get_escalations.py', { cwd: backendDir });
    const escalations = JSON.parse(stdout);
    return NextResponse.json({ escalations });
  } catch (error) {
    console.error('Error fetching escalations:', error);
    return NextResponse.json({ error: 'Failed to fetch escalations' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { reference_id, status } = await request.json();
    
    if (!reference_id || !status) {
      return NextResponse.json({ error: 'Missing reference_id or status' }, { status: 400 });
    }

    const { stdout } = await execPromise(`uv run python src/get_escalations.py update "${reference_id}" "${status}"`, { cwd: backendDir });
    const result = JSON.parse(stdout);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating escalation:', error);
    return NextResponse.json({ error: 'Failed to update escalation' }, { status: 500 });
  }
}
