    (function(window){

    window.Bezier = Bezier;

    var prototype = Bezier.prototype = Object.create( Object.prototype );
    prototype.constructor = Bezier;


    function Bezier(){}


    /**
     * Private interface.
     */

    Bezier.getY = function(x, p0, p1, p2, p3)
    {
        // Determine t
        var t;

        if (x == p0.x) 
        {
            // Handle corner cases explicitly to prevent rounding errors
            t = 0;
        } 
        else 
        if (x == p3.x) 
        {
            t = 1;
        } 
        else 
        {
            // Calculate t
            var a = -p0.x + 3 * p1.x - 3 * p2.x + p3.x;
            var b = 3 * p0.x - 6 * p1.x + 3 * p2.x;
            var c = -3 * p0.x + 3 * p1.x;
            var d = p0.x - x;
            var tTemp = Bezier.solveCubic(a, b, c, d);

            if( tTemp == null ) 
                return null;

            t = tTemp;
        }


        // Calculate y from t
        return Bezier.cubed(1 - t) * p0.y
            + 3 * t * Bezier.squared(1 - t) * p1.y
            + 3 * Bezier.squared(t) * (1 - t) * p2.y
            + Bezier.cubed(t) * p3.y;
    }

    // Solves the equation ax³+bx²+cx+d = 0 for x ϵ ℝ
    // and returns the first result in [0, 1] or null.
    Bezier.solveCubic = function(a, b, c, d) 
    {
        if (a == 0) return Bezier.solveQuadratic(b, c, d);
        if (d == 0) return 0;

        b /= a;
        c /= a;
        d /= a;

        var q = ( 3.0 * c - Bezier.squared(b) ) / 9.0;
        var r = ( -27.0 * d + b * ( 9.0 * c - 2.0 * Bezier.squared( b ) ) ) / 54.0;
        var disc = Bezier.cubed( q ) + Bezier.squared( r );
        var term1 = b / 3.0;

        if( disc > 0 ) 
        {
            var s = r + Math.sqrt(disc);
            s = (s < 0) ? -Bezier.cubicRoot( -s ) : Bezier.cubicRoot( s );
            
            var t = r - Math.sqrt(disc);
            t = (t < 0) ? -Bezier.cubicRoot( -t ) : Bezier.cubicRoot( t );

            var result = -term1 + s + t;

            if( result >= 0 && result <= 1 ) 
                return result;
        } 
        else 
        if( disc == 0 ) 
        {
            var r13 = (r < 0) ? -Bezier.cubicRoot( -r ) : Bezier.cubicRoot( r );

            var result = -term1 + 2.0 * r13;
            
            if (result >= 0 && result <= 1) 
                return result;

            result = -(r13 + term1);
            
            if (result >= 0 && result <= 1) 
                return result;
        } 
        else 
        {
            q = -q;

            var dum1 = q * q * q;
            dum1 = Math.acos(r / Math.sqrt( dum1 ));
         

            var r13 = 2.0 * Math.sqrt( q );
            var result = -term1 + r13 * Math.cos( dum1 / 3.0 );
            
            if (result >= 0 && result <= 1) 
                return result;

            result = -term1 + r13 * Math.cos( (dum1 + 2.0 * Math.PI ) / 3.0);
            
            if (result >= 0 && result <= 1) 
                return result;

            result = -term1 + r13 * Math.cos( (dum1 + 4.0 * Math.PI ) / 3.0);
            
            if( result >= 0 && result <= 1 ) 
                return result;
        }

        return null;
    }

    // Solves the equation ax² + bx + c = 0 for x ϵ ℝ
    // and returns the first result in [0, 1] or null.
    Bezier.solveQuadratic = function(a, b, c) 
    {
        var result = (-b + Math.sqrt( Bezier.squared(b) - 4 * a * c) ) / (2 * a);

        if (result >= 0 && result <= 1) 
            return result;

        result = (-b - Math.sqrt( Bezier.squared(b) - 4 * a * c) ) / (2 * a);
        
        if (result >= 0 && result <= 1) 
            return result;

        return null;
    }

    Bezier.squared = function(f) { return f * f; }

    Bezier.cubed = function(f) { return f * f * f; }

    Bezier.cubicRoot = function(f) { return Math.pow( f, 1.0 / 3.0 ); }

    }(window));