<?php

namespace App\Controller;

use App\Entity\BlocCMS;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/blocCMS')]
class BlocCmsController extends AbstractController
{
    #[Route('/{key}', name: 'app_bloc_cms')]
    public function index(BlocCMS $blocCMS): Response
    {
        $response = new Response();
        $response->setPublic();
        $response->setMaxAge(3600);

        return $this->render('bloc_cms/index.html.twig', [
            'blocCMS' => $blocCMS,
        ], $response);
    }
}
