<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    /**
     * Force API requests to receive JSON responses.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        if (
            $request->isJson()
            && trim($request->getContent()) !== ''
        ) {
            json_decode($request->getContent(), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'message' => 'The request body contains invalid JSON.',
                ], 400);
            }
        }

        return $next($request);
    }
}