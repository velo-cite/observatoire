<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(): Response
    {
        return $this->render('home/index.html.twig', [
            'controller_name' => 'HomeController',
        ]);
    }

    #[Route('/evolution_pratique', name: 'app_evolution_pratique')]
    public function evolutionPratique(): Response
    {
        return $this->render('home/evolution_pratique.html.twig', [
        ]);
    }

    #[Route('/engagement', name: 'app_engagement')]
    public function engagement(): Response
    {
        return $this->render('home/engagement.html.twig', [
        ]);
    }
}
