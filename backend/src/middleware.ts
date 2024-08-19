import type { Express } from "express"
import cors, { type CorsOptions } from 'cors';
import bodyParser from 'body-parser';

// modularize middleware, too many repetitions
