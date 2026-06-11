package de.nordbyte.mavazihub;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductController {

    @GetMapping("/test")
    public String helloworld(){
        return "Hello World";
    }
}


